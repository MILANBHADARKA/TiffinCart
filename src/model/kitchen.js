import mongoose from 'mongoose';

const kitchenSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
    cuisine: {
        type: String,
        required: true,
        enum: ['indian', 'chinese', 'italian', 'continental', 'mexican', 'thai', 'japanese', 'korean', 'mediterranean']
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
        },
        coordinates: {
            latitude: Number,
            longitude: Number
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
        type: String
    }],
    operatingHours: {
        morning: {
            open: {
                type: String, // HH:mm format
                default: '07:00'
            },
            close: {
                type: String, 
                default: '10:00'
            }
        },
        afternoon: {
            open: {
                type: String,
                default: '12:00'
            },
            close: {
                type: String,
                default: '15:00'
            }
        },
        evening: {
            open: {
                type: String,
                default: '18:00'
            },
            close: {
                type: String,
                default: '21:00'
            }
        }
    },
    isCurrentlyOpen: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    deliveryInfo: {
        deliveryRadius: {
            type: Number,
            default: 10 // kilometers
        },
        minimumOrder: {
            type: Number,
            default: 100 
        },
        deliveryFee: {
            type: Number,
            default: 0
        },
        estimatedDeliveryTime: {
            type: Number,
            default: 30 // minutes
        }
    },
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
    license: {
        fssaiNumber: String,
        gstNumber: String,
        businessLicense: String
    },
    bankDetails: {
        accountNumber: String,
        ifscCode: String,
        accountHolderName: String,
        bankName: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'suspended'],
        default: 'pending'
    },
    adminRemarks: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Indexes for better query performance
kitchenSchema.index({ ownerId: 1 });
kitchenSchema.index({ 'address.city': 1, isActive: 1 });
kitchenSchema.index({ cuisine: 1, isActive: 1 });
kitchenSchema.index({ 'ratings.average': -1 });
kitchenSchema.index({ status: 1 });

const Kitchen = mongoose.models.Kitchen || mongoose.model('Kitchen', kitchenSchema);

export default Kitchen;