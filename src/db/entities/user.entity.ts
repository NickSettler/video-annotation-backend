import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { E_DB_TABLES } from '../constants';
import { E_ROLE_ENTITY_KEYS, Role } from './role.entity';
import { Exclude } from 'class-transformer';
import { hashSync } from 'bcrypt';

export enum E_USER_ENTITY_KEYS {
  ID = 'id',
  USERNAME = 'username',
  EMAIL = 'email',
  PASSWORD = 'password',
  REFRESH_TOKEN = 'refresh_token',
  ROLES = 'roles',
}

@Entity({
  name: E_DB_TABLES.USERS,
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  [E_USER_ENTITY_KEYS.ID]: string;

  @Column({
    unique: true,
  })
  [E_USER_ENTITY_KEYS.USERNAME]: string;

  @Column({
    unique: true,
  })
  [E_USER_ENTITY_KEYS.EMAIL]: string;

  @Column()
  @Exclude()
  [E_USER_ENTITY_KEYS.PASSWORD]: string;

  @Column({
    nullable: true,
  })
  @Exclude()
  [E_USER_ENTITY_KEYS.REFRESH_TOKEN]: string;

  @ManyToMany(() => Role)
  @JoinTable({
    name: E_DB_TABLES.USER_ROLES,
    joinColumn: {
      name: 'user_id',
      referencedColumnName: E_USER_ENTITY_KEYS.ID,
    },
    inverseJoinColumn: {
      name: 'role_name',
      referencedColumnName: E_ROLE_ENTITY_KEYS.NAME,
    },
  })
  [E_USER_ENTITY_KEYS.ROLES]: Array<Role>;

  @Exclude()
  private tempPassword: string;

  @AfterLoad()
  private loadTempPassword(): void {
    this.tempPassword = this.password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  private async hashPassword() {
    if (this.tempPassword !== this.password)
      this[E_USER_ENTITY_KEYS.PASSWORD] = hashSync(this.password, 10);
  }
}
