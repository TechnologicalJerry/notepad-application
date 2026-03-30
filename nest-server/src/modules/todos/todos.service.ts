import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo, TodoDocument } from './schemas/todo.schema';

@Injectable()
export class TodosService {
  constructor(@InjectModel(Todo.name) private readonly todoModel: Model<TodoDocument>) {}

  async create(userId: string, createTodoDto: CreateTodoDto) {
    try {
      const todo = await this.todoModel.create({
        ...createTodoDto,
        ownerId: new Types.ObjectId(userId),
      });
      return todo;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: number }).code === 11000
      ) {
        throw new ConflictException('A todo with this title already exists');
      }
      throw error;
    }
  }

  async findAll(userId: string) {
    return this.todoModel
      .find({ ownerId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(userId: string, id: string) {
    const todo = await this.todoModel
      .findOne({ _id: id, ownerId: new Types.ObjectId(userId) })
      .exec();

    if (!todo) {
      throw new NotFoundException('Requested todo not found');
    }

    return todo;
  }

  async update(userId: string, id: string, updateTodoDto: UpdateTodoDto) {
    const todo = await this.todoModel
      .findOneAndUpdate(
        { _id: id, ownerId: new Types.ObjectId(userId) },
        updateTodoDto,
        { new: true, runValidators: true },
      )
      .exec();

    if (!todo) {
      throw new NotFoundException('Requested todo not found');
    }

    return todo;
  }

  async remove(userId: string, id: string) {
    const todo = await this.todoModel
      .findOneAndDelete({ _id: id, ownerId: new Types.ObjectId(userId) })
      .exec();

    if (!todo) {
      throw new NotFoundException('Requested todo not found');
    }

    return todo;
  }
}
