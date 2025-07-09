import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.notifications, { eager: true })
  recipient: User;

  @Column()
  message: string;

  @Column({ default: false })
  read: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
