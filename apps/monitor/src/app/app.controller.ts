import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import { isBase58 } from 'class-validator';
import { RegisterValidatorDto } from './app.dto';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('program-list')
  getPrograms() {
    return this.appService.findPrograms();
  }

  @Get('program-id')
  async getProgramId() {
    return { program_id: await this.appService.findProgramId() };
  }

  @Put(':program_id/use')
  useProgramId(@Param('program_id') programId: string) {
    return this.appService.useProgramId(programId);
  }

  @Post(':program_id/register-validator')
  async registerNewValidator(
    @Param('program_id') programId: string,
    @Body()
    newValidator: RegisterValidatorDto
  ) {
    const {
      rarities,
      rarity_names,
      unit_backing,
      max_primary_stake,
      initial_redemption_fee,
      is_validator_id_switchable,
    } = newValidator;
    if (!isBase58(programId))
      throw new HttpException(
        'program_id must be a base 58 encoded string',
        HttpStatus.BAD_REQUEST
      );
    if (!is_validator_id_switchable && initial_redemption_fee !== 0)
      throw new HttpException(
        'Validator id must be switchable if there exists any redemption fee',
        HttpStatus.BAD_REQUEST
      );
    if (max_primary_stake < unit_backing)
      throw new HttpException(
        'Max primary stake must be greater unit backing.',
        HttpStatus.BAD_REQUEST
      );
    if (rarities.length !== rarity_names.length)
      throw new HttpException(
        'Rarity names array length must be equal to rarities array length',
        HttpStatus.BAD_REQUEST
      );
    if (rarities.reduce((total, rarity) => total + rarity.rarity, 0) !== 10_000)
      throw new HttpException(
        'Rarities must sum to 10000',
        HttpStatus.BAD_REQUEST
      );
    return this.appService.registerValidator(
      new PublicKey(programId),
      newValidator
    );
  }
}
