import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => User, user => user.comments, { eager: true })
  user: User;

  @ManyToOne(() => Comment, comment => comment.children, { nullable: true, onDelete: 'CASCADE' })
  parent?: Comment;

  @OneToMany(() => Comment, comment => comment.parent, { cascade: true })
  children: Comment[];
}
