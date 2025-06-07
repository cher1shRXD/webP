import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Room } from './Room';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  text!: string;

  @ManyToOne(() => Room, (room) => room.id)
  roomId!: number;
}
