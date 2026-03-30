import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LoginSessionDocument = HydratedDocument<LoginSession>;

@Schema({ timestamps: true, versionKey: false })
export class LoginSession {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  accessToken: string;

  @Prop({ required: true })
  refreshToken: string;
}

export const LoginSessionSchema = SchemaFactory.createForClass(LoginSession);
