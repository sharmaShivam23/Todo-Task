import mongoose, { Document, Schema } from 'mongoose';

export interface IErrorLog extends Document {
  message: string;
  stack?: string;
  route?: string;
  method?: string;
  statusCode?: number;
  user?: mongoose.Types.ObjectId;
  timestamp: Date;
}

const errorLogSchema = new Schema<IErrorLog>(
  {
    message: {
      type: String,
      required: true,
    },
    stack: {
      type: String,
    },
    route: {
      type: String,
    },
    method: {
      type: String,
    },
    statusCode: {
      type: Number,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IErrorLog>('ErrorLog', errorLogSchema);


