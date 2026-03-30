import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TodoDocument = HydratedDocument<Todo>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Todo {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  body: string;

  @Prop({ required: true, trim: true })
  category: string;

  @Prop({ required: true, trim: true })
  subCategory: string;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
TodoSchema.index({ ownerId: 1, title: 1 }, { unique: true });
