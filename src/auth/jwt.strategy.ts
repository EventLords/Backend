// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'SUPER_SECRET_KEY',
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub, // ← acest câmp EXISTĂ în req.user
      role: payload.role,
      isApproved: payload.isApproved,
    };
  }
}
