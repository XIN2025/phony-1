import { IsEnum } from 'class-validator';
import { ModelType } from 'src/common/enums/ModelType.enum';

export class UpdateModelTypeDto {
  @IsEnum(ModelType)
  model_type: ModelType;
}
