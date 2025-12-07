import { Controller, Post, Request, UseGuards, Get, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport'; // Alias para LocalAuthGuard
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // Renombrado para claridad
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local')) // Usa el 'local' strategy
  @Post('login')
  async login(@Request() req, @Body() loginUserDto: LoginUserDto) { // @Body() para validar el DTO
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user; // req.user es llenado por JwtStrategy
  }
}
