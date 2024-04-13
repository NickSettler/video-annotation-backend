import { Injectable } from '@nestjs/common';
import { E_USER_ENTITY_KEYS, User } from '../db/entities/user.entity';
import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from '@casl/ability';
import { E_ACTION, E_MANAGE_ACTION } from './actions';
import { map } from 'lodash';
import { E_ROLE, E_ROLE_ENTITY_KEYS } from '../db/entities/role.entity';
import { AddRule } from './types';
import {
  E_WORKSPACE_ENTITY_KEYS,
  Workspace,
} from '../db/entities/workspace.entity';
import { E_VIDEO_ENTITY_KEYS, Video } from '../db/entities/video.entity';
import { E_POSTER_ENTITY_KEYS, Poster } from '../db/entities/poster.entity';
import { Project } from '../db/entities/project.entity';

export type TSubjects =
  | InferSubjects<
      | typeof Poster
      | typeof Project
      | typeof User
      | typeof Video
      | typeof Workspace
    >
  | 'all';

export type TAbility = MongoAbility<
  [E_ACTION | typeof E_MANAGE_ACTION, TSubjects]
>;

@Injectable()
export class CaslAbilityFactory {
  private static applyUserRules(user: User, can: AddRule<TAbility>): void {
    // User
    can([E_ACTION.READ, E_ACTION.UPDATE], User, {
      [E_USER_ENTITY_KEYS.ID]: user[E_USER_ENTITY_KEYS.ID],
    });

    // Workspace
    can(E_ACTION.CREATE, Workspace);

    can([E_ACTION.READ, E_ACTION.UPDATE, E_ACTION.DELETE], Workspace, {
      [`${[E_WORKSPACE_ENTITY_KEYS.CREATED_BY]}.${[E_USER_ENTITY_KEYS.ID]}`]:
        user[E_USER_ENTITY_KEYS.ID],
    });

    // Video
    can(E_ACTION.CREATE, Video);

    can([E_ACTION.READ, E_ACTION.UPDATE, E_ACTION.DELETE], Video, {
      [`${[E_WORKSPACE_ENTITY_KEYS.CREATED_BY]}.${[E_USER_ENTITY_KEYS.ID]}`]:
        user[E_USER_ENTITY_KEYS.ID],
    });

    // Poster
    can([E_ACTION.READ, E_ACTION.UPDATE, E_ACTION.DELETE], Poster, {
      [`${[E_POSTER_ENTITY_KEYS.VIDEO]}.${[E_VIDEO_ENTITY_KEYS.CREATED_BY]}`]:
        user[E_USER_ENTITY_KEYS.ID],
    });

    can([E_ACTION.READ, E_ACTION.UPDATE, E_ACTION.DELETE], Poster, {
      [`${[E_POSTER_ENTITY_KEYS.VIDEO]}.${[E_VIDEO_ENTITY_KEYS.CREATED_BY]}.${E_USER_ENTITY_KEYS.ID}`]:
        user[E_USER_ENTITY_KEYS.ID],
    });

    // Project
    can(E_ACTION.CREATE, Project);

    can([E_ACTION.READ, E_ACTION.UPDATE, E_ACTION.DELETE], Project, {
      [`${[E_WORKSPACE_ENTITY_KEYS.CREATED_BY]}.${[E_USER_ENTITY_KEYS.ID]}`]:
        user[E_USER_ENTITY_KEYS.ID],
    });
  }

  public createForUser(user: User | undefined): TAbility {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { can, cannot, build } = new AbilityBuilder<TAbility>(
      createMongoAbility,
    );

    const userRoles: Array<E_ROLE> = map(
      user?.[E_USER_ENTITY_KEYS.ROLES],
      E_ROLE_ENTITY_KEYS.NAME,
    );

    if (userRoles.includes(E_ROLE.USER)) {
      CaslAbilityFactory.applyUserRules(user, can);
    }

    if (userRoles.includes(E_ROLE.ADMIN)) {
      can(E_MANAGE_ACTION, 'all');
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<TSubjects>,
    });
  }
}
