import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Room } from './Room';

@Entity()
export class Question {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  text!: string;

  @ManyToOne(() => Room, (room) => room.id)
  room!: Room;

  @Column({ default: 0 })
  totalCount!: number;

  @Column({ default: 0 })
  yesCount!: number;

  @Column({ default: 0 })
  noCount!: number;
}
