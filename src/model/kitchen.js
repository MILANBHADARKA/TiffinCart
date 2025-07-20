import mongoose from 'mongoose';

const kitchenSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ownerName: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        maxLength: 500
    },
    address: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        }
    },
    contact: {
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    images: [{
        type: String // URLs to kitchen images
    }],
    operatingHours: {
        morning: {
            open: {
                type: String, // HH:mm format
                default: '07:00'
            },
            close: {
                type: String, // HH:mm format
                default: '10:00'
            }
        },
        afternoon: {
            open: {
                type: String, // HH:mm format
                default: '12:00'
            },
            close: {
                type: String, // HH:mm format
                default: '15:00'
            }
        },
        evening: {
            open: {
                type: String, // HH:mm format
                default: '18:00'
            },
            close: {
                type: String, // HH:mm format
                default: '21:00'
            }
        }
    },
    isCurrentlyOpen: {
        type: Boolean, 
        default: false
    },
    // deliveryInfo: {
    //     deliveryRadius: {
    //         type: Number,
    //         default: 10 // in kilometers
    //     },
    //     minimumOrder: {
    //         type: Number,
    //         default: 100 // in currency
    //     },
    //     deliveryFee: {
    //         type: Number,
    //         default: 0
    //     },
    //     estimatedDeliveryTime: {
    //         type: Number,
    //         default: 30 // in minutes
    //     }
    // },
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        totalReviews: {
            type: Number,
            default: 0
        }
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'suspended'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Indexes for better query performance
kitchenSchema.index({ ownerId: 1 });
kitchenSchema.index({ 'address.city': 1, isActive: 1 });
kitchenSchema.index({ cuisine: 1, isActive: 1 });
kitchenSchema.index({ 'ratings.average': -1 });

// const Kitchen = mongoose.models.Kitchen || mongoose.model('Kitchen', kitchenSchema);

// export default Kitchen;

export default mongoose.models.Kitchen || mongoose.model("Kitchen", kitchenSchema);