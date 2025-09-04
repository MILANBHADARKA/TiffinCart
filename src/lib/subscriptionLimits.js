import { SellerSubscription, SubscriptionPlan } from "@/model/subscription";
import Kitchen from "@/model/kitchen";
import MenuItem from "@/model/menuItem";

export async function getSellerLimits(sellerId) {
    try {
        const activeSubscription = await SellerSubscription.findOne({
            sellerId,
            status: 'active'
        }).populate('planId');

        if (activeSubscription && activeSubscription.planId) {
            return activeSubscription.planId.features;
        }

        // Default free plan limits
        return {
            maxKitchens: 1,
            maxMenuItemsPerKitchen: 3,
            prioritySupport: false,
            analyticsAccess: false,
            customization: false
        };
    } catch (error) {
        console.error("Error getting seller limits:", error);
        // Return default limits on error
        return {
            maxKitchens: 1,
            maxMenuItemsPerKitchen: 3,
            prioritySupport: false,
            analyticsAccess: false,
            customization: false
        };
    }
}

export async function checkKitchenLimit(sellerId) {
    const limits = await getSellerLimits(sellerId);
    const currentKitchens = await Kitchen.countDocuments({ ownerId: sellerId });
    
    // If maxKitchens is -1, it means unlimited
    const canCreate = limits.maxKitchens === -1 || currentKitchens < limits.maxKitchens;
    
    return {
        canCreate,
        current: currentKitchens,
        max: limits.maxKitchens,
        remaining: limits.maxKitchens === -1 ? -1 : Math.max(0, limits.maxKitchens - currentKitchens)
    };
}

export async function checkMenuItemLimit(kitchenId) {
    const kitchen = await Kitchen.findById(kitchenId);
    if (!kitchen) {
        throw new Error("Kitchen not found");
    }

    const limits = await getSellerLimits(kitchen.ownerId);
    const currentMenuItems = await MenuItem.countDocuments({ kitchenId });
    
    // If maxMenuItemsPerKitchen is -1, it means unlimited
    const canCreate = limits.maxMenuItemsPerKitchen === -1 || currentMenuItems < limits.maxMenuItemsPerKitchen;
    
    return {
        canCreate,
        current: currentMenuItems,
        max: limits.maxMenuItemsPerKitchen,
        remaining: limits.maxMenuItemsPerKitchen === -1 ? -1 : Math.max(0, limits.maxMenuItemsPerKitchen - currentMenuItems)
    };
}
