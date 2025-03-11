import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { EnumService } from '../services/enum.service';

@ValidatorConstraint({ async: false })
export class IsEnumValidConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [enumName] = args.constraints; // Nombre del ENUM
    const validValues = EnumService.getEnumValues(enumName); // Obtiene valores permitidos
    return validValues.includes(value);
  }

  defaultMessage(args: ValidationArguments) {
    const [enumName] = args.constraints;
    const validValues = EnumService.getEnumValues(enumName);
    return `${args.property} debe ser uno de: ${validValues.join(', ')}`;
  }
}

// ✅ Decorador personalizado para validar enums dinámicos
export function IsEnumValid(enumName: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [enumName],
      validator: IsEnumValidConstraint,
    });
  };
}
