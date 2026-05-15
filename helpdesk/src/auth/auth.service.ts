import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async login(body: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
      include: { additionalRoles: true }, // ← inclut les rôles supplémentaires
    })

    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect')

    const isValid = await bcrypt.compare(body.password, user.password)
    if (!isValid) throw new UnauthorizedException('Email ou mot de passe incorrect')

    // Combine le rôle principal + les rôles supplémentaires sans doublons
    const allRoles = [
      user.role,
      ...user.additionalRoles.map(r => r.role)
    ].filter((v, i, a) => a.indexOf(v) === i)

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,   // rôle principal (pour la compatibilité avec les guards)
      roles: allRoles,   // tous les rôles (pour le frontend)
    }

    const token = await this.jwtService.signAsync(payload)

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roles: allRoles,
      },
    }
  }

  async register(body: { email: string; password: string; name: string; role?: UserRole }) {
    const hashed = await bcrypt.hash(body.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: body.email,
        password: hashed,
        name: body.name,
        role: body.role ?? UserRole.CLIENT,
      },
    });

    return { message: 'Compte créé', userId: user.id };
  }
}
