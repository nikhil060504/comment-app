import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Comment } from '../comments/comment.entity';
import { Notification } from '../notifications/notification.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Comment, comment => comment.user)
  comments: Comment[];

  @OneToMany(() => Notification, notification => notification.recipient)
  notifications: Notification[];
}
