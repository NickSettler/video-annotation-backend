import { E_USER_ENTITY_KEYS, User } from '../db/entities/user.entity';
import { Test } from '@nestjs/testing';
import { CaslAbilityFactory, TAbility } from './casl-ability.factory';
import { E_ACTION, E_MANAGE_ACTION } from './actions';
import { constant, reduce, times, values } from 'lodash';
import { map } from 'lodash';
import { E_ROLE, E_ROLE_ENTITY_KEYS } from '../db/entities/role.entity';
import { Workspace } from '../db/entities/workspace.entity';

export const generateExpected = (
  actions: Array<E_ACTION>,
  expected: Array<boolean>,
): Partial<Record<E_ACTION, boolean>> => {
  if (actions.length !== expected.length)
    throw new Error('actions and expected arrays must have the same length');

  return reduce(
    actions,
    (acc, action, index) => ({
      ...acc,
      [action]: expected[index],
    }),
    {},
  );
};

describe('CaslAbilityFactory test', () => {
  let abilityFactory: CaslAbilityFactory;
  let user: User;
  let ability: TAbility;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CaslAbilityFactory],
    }).compile();

    abilityFactory = await module.resolve(CaslAbilityFactory);
  });

  describe('User', () => {
    beforeEach(() => {
      user = new User();
      user[E_USER_ENTITY_KEYS.ROLES] = [
        {
          [E_ROLE_ENTITY_KEYS.NAME]: E_ROLE.USER,
        },
      ];
      ability = abilityFactory.createForUser(user);
    });

    describe('Users', () => {
      const expected = generateExpected(values(E_ACTION), [
        false,
        true,
        true,
        false,
      ]);

      map(expected, (value, action: E_ACTION) => {
        it(`Can ${action} users`, () => {
          expect(ability.can(action, User)).toEqual(value);
        });
      });
    });

    describe('Workspace', () => {
      const expected = generateExpected(
        values(E_ACTION),
        times(4, constant(true)),
      );

      map(expected, (value, action: E_ACTION) => {
        it(`Can ${action} workspace`, () => {
          expect(ability.can(action, Workspace)).toEqual(value);
        });
      });
    });
  });

  describe('Admin', () => {
    beforeEach(() => {
      user = new User();
      user[E_USER_ENTITY_KEYS.ROLES] = [
        {
          [E_ROLE_ENTITY_KEYS.NAME]: E_ROLE.ADMIN,
        },
      ];
      ability = abilityFactory.createForUser(user);
    });

    describe('Users', () => {
      it(`Can manage users`, () => {
        expect(ability.can(E_MANAGE_ACTION, User)).toEqual(true);
      });
    });

    describe('Workspace', () => {
      it(`Can manage workspaces`, () => {
        expect(ability.can(E_MANAGE_ACTION, Workspace)).toEqual(true);
      });
    });
  });
});
