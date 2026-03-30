import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodosService } from './todos.service';

@ApiTags('Todos')
@ApiBearerAuth()
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  async create(
    @CurrentUser() user: { userId: string },
    @Body() createTodoDto: CreateTodoDto,
  ) {
    const todo = await this.todosService.create(user.userId, createTodoDto);
    return { todo, msg: 'Todo has been created!' };
  }

  @Get()
  async findAll(@CurrentUser() user: { userId: string }) {
    const todos = await this.todosService.findAll(user.userId);
    return { todos, msg: 'All Todos have been fetched!' };
  }

  @Get(':id')
  async findOne(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    const todo = await this.todosService.findOne(user.userId, id);
    return { todo, msg: 'Success' };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    const todo = await this.todosService.update(user.userId, id, updateTodoDto);
    return { todo, msg: 'Todo has been updated' };
  }

  @Delete(':id')
  async remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    const todo = await this.todosService.remove(user.userId, id);
    return { todo, msg: 'Todo has been deleted' };
  }
}
