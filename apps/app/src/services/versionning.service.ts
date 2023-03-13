import { http } from '@ingl-permissionless/axios';
import { ProgramVersion } from '../interfaces';

export async function verifyVersion(programId: string) {
  const { data: programVersion } = await http.get<ProgramVersion | null>(
    `/program-versions/verify?program_id=${programId}`
  );
  return programVersion;
}
