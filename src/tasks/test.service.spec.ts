import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';

const mockUser = {
  id: 12,
  username: 'Test user',
};

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

describe('TaskService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('gets all tasks from repository', async () => {
      const equalValue = 'someValue';
      taskRepository.getTasks.mockResolvedValue(equalValue);
      expect(taskRepository.getTasks).not.toHaveBeenCalled();

      const filters: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'Some query',
      };
      const result = await tasksService.getTasks(filters, mockUser);

      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual(equalValue);
    });
  });

  describe('getTaskById', () => {
    it('calls taskRepository.findOne() and successfully retrive and return the task', async () => {
      const mockTask = {
        title: 'Title',
        description: 'Description',
      };
      taskRepository.findOne.mockResolvedValue(mockTask);

      const result = await tasksService.getTaskById(1, mockUser);
      expect(result).toEqual(mockTask);

      expect(taskRepository.findOne).toBeCalledWith({
        where: { id: 1, userId: mockUser.id },
      });
    });

    it('throws an error if task is not found', () => {
      taskRepository.findOne.mockResolvedValue(null); // resolve findOne with no results
      expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    const createTaskDto: CreateTaskDto = {
      title: 'Title',
      description: 'Description',
    };

    it('create task', () => {
      tasksService.createTask(createTaskDto, mockUser);

      expect(taskRepository.createTask).toHaveBeenCalledWith(
        createTaskDto,
        mockUser,
      );
    });

    it('should return result', async () => {
      taskRepository.createTask.mockResolvedValue('someTask');
      const result = await tasksService.createTask(createTaskDto, mockUser);

      expect(result).toEqual('someTask');
    });
  });

  describe('deleteTask', () => {
    it('call taskRepository.deleteTask() to delete a task', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 });
      expect(taskRepository.delete).not.toHaveBeenCalled();

      await tasksService.deleteTask(1, mockUser);
      expect(taskRepository.delete).toHaveBeenCalledWith({
        id: 1,
        userId: mockUser.id,
      });
    });

    it('trows an error as task could not be found', () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });

      expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTaskStatus', () => {


    it('update task with provided status', async () => {
      tasksService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.OPEN,
        save: jest.fn().mockResolvedValue(true),
      });
      expect(tasksService.getTaskById).not.toHaveBeenCalled()

      const result = await tasksService.updateTaskStatus(
        1,
        TaskStatus.IN_PROGRESS,
        mockUser,
      );

      expect(tasksService.getTaskById).toHaveBeenCalled();
      expect(result.status).toEqual(TaskStatus.IN_PROGRESS);
      expect(result.save).toHaveBeenCalled();
    });
  });
});
