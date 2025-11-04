import { supabase } from './supabaseClient';
import { User, ActionType, TargetType } from '../types';

export const logActivity = async (
    user: User | null, 
    action: ActionType, 
    targetType: TargetType | null, 
    description: string
) => {
    if (!user) {
        console.warn("Attempted to log activity without a user.");
        return;
    }

    try {
        const { error } = await supabase.from('activity_log').insert({
            user_id: user.user_id,
            user_full_name: user.full_name,
            action_type: action,
            target_type: targetType,
            description: description,
        });
        if (error) throw error;
    } catch (error) {
        console.error(error);
    }
};
