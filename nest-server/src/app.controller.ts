import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get('healthcheck')
  @ApiOperation({ summary: 'Healthcheck endpoint' })
  healthcheck() {
    return { status: 'ok' };
  }
}
