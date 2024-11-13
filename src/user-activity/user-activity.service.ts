import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserActivity } from '../common/schemas/user-activity.schema';

@Injectable()
export class UserActivityService {
    constructor(@InjectModel(UserActivity.name) private userActivityModel: Model<UserActivity>) { }

    async createUserActivity(username: string, postId: string, activityType: string) {
        const activity = new this.userActivityModel({ username, postId, activityType });
        await activity.save(); // Simpan ke MongoDB

        console.log('User activity saved:', activity);
        return activity; // Kembalikan aktivitas yang baru disimpan
    }

    async getUserActivitiesByUsername(username: string) {
        console.log("user:",username);
        const activities = await this.userActivityModel.find({ username }).select('-__v');
        console.log("activities:",activities);
        const formattedActivities = activities.map(activity => ({
            ...activity.toObject(),
            timestamp: new Date(activity.timestamp).toLocaleString(),  // Ubah format timestamp jika dibutuhkan
        }));
        console.log("formattedActivities:",formattedActivities);
        return formattedActivities;
    }

    async aggregateUserActivitiesSortedByDay(username: string) {
        const results = await this.userActivityModel.aggregate([
            { $match: { username: username } },
            { $project: { day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, activityType: 1 } },
            { $group: { _id: { day: '$day', activityType: '$activityType' }, activityCount: { $sum: 1 } } },
            { $project: { day: '$_id.day', activityType: '$_id.activityType', activityCount: 1, _id: 0 } },
            { $sort: { day: 1 } },
        ]);

        return results;
    }
}
