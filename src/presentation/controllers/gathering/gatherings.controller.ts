import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { GatheringsService } from 'src/domain/services/gathering/gatherings.service';

@UseGuards(AuthGuard)
@Controller('gatherings')
export class GatheringsController {
  constructor(private readonly gatheringsService: GatheringsService) {}
}
