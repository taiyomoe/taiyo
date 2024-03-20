import { FileValidator } from "@nestjs/common"
import { type MimeType, fileTypeFromBuffer } from "file-type"

export class FileTypeValidator extends FileValidator<MimeType[]> {
  /**
   * Indicates if this file should be considered valid, according to the options passed in the constructor.
   * @param file the file from the request object
   */
  async isValid(file: Express.Multer.File) {
    const parsed = await fileTypeFromBuffer(file.buffer)

    if (!parsed) return false

    return this.validationOptions.includes(parsed.mime)
  }

  /**
   * Builds an error message in case the validation fails.
   * @param file the file from the request object
   */
  buildErrorMessage(file: Express.Multer.File) {
    return `The file type of '${
      file.originalname
    }' is invalid. Allowed types: ${this.validationOptions.join(", ")}.`
  }
}
