import {
  Resolver,
  ObjectType,
  Field,
  Mutation,
  InputType,
  Arg,
  Query,
  Ctx,
} from 'type-graphql';
import { User } from '../entities/User';
import * as argon2 from 'argon2';
import { MyContext } from 'src/types';

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@InputType()
export class UserRegisterInput {
  @Field()
  email: string;
  @Field()
  username: string;
  @Field()
  password: string;
}

@InputType()
export class UserLoginInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@Resolver(User)
export class UserResolver {
  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    // you are not logged in
    if (!req.session.userId) {
      return null;
    }

    return User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UserRegisterInput,
  ): Promise<UserResponse> {
    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      user = await User.create({ ...options, password: hashedPassword }).save();
    } catch (err) {
      // postgres unique_violation code
      if (err.code === '23505') {
        return {
          errors: [
            {
              field: 'username',
              message: 'username already taken',
            },
          ],
        };
      }
    }
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UserLoginInput,
    @Ctx() { req }: MyContext,
  ): Promise<UserResponse> {
    const user = await User.findOne({ username: options.username });

    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: "username doesn't exist",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, options.password);

    if (!valid) {
      return {
        errors: [
          {
            field: 'username or password',
            message: 'inavlid username or password',
          },
        ],
      };
    }

    req.session.userId = user.id;

    return { user };
  }
}
