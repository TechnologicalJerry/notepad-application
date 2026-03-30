import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  @Public()
  @Get('healthcheck')
  @ApiOperation({ summary: 'Healthcheck endpoint' })
  healthcheck() {
    return { status: 'ok' };
  }
}
