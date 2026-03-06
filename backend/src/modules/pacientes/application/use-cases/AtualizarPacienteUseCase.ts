/**
 * AtualizarPacienteUseCase - Atualiza paciente existente
 *
 * Use Case que orquestra a atualização de dados de um paciente com validações,
 * persistência e publicação de eventos.
 */

import { logger } from "@/infrastructure/logger";
import { eventBus } from "@/shared/events/EventBus";
import { IPatientRepository } from "../../domain/repositories/IPatientRepository";

export interface AtualizarPacienteDTO {
  id: string;
  clinicId: string;
  fullName?: string;
  cpf?: string;
  rg?: string;
  birthDate?: string;
  gender?: string;
  email?: string;
  phone?: string;
  mobile?: string;

  // Endereço
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  addressZipcode?: string;

  notes?: string;
  updatedBy?: string;
}

export class AtualizarPacienteUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(dto: AtualizarPacienteDTO): Promise<{ patientId: string }> {
    logger.info("AtualizarPacienteUseCase: Starting", {
      patientId: dto.id,
      clinicId: dto.clinicId,
    });

    const patient = await this.patientRepository.findById(dto.id, dto.clinicId);

    if (!patient) {
      throw new Error("Paciente não encontrado");
    }

    // Validar duplicação por CPF se estiver sendo alterado
    if (dto.cpf && dto.cpf !== patient.cpf) {
      const existingByCPF = await this.patientRepository.findByCPF(
        dto.cpf,
        dto.clinicId,
      );
      if (existingByCPF && existingByCPF.id !== patient.id) {
        throw new Error("Já existe outro paciente cadastrado com este CPF");
      }
    }

    // Validar duplicação por email se estiver sendo alterado
    if (dto.email && dto.email !== patient.email) {
      const existingByEmail = await this.patientRepository.findByEmail(
        dto.email,
        dto.clinicId,
      );
      if (existingByEmail && existingByEmail.id !== patient.id) {
        throw new Error("Já existe outro paciente cadastrado com este email");
      }
    }

    // Atualizar dados pessoais
    patient.atualizarDadosPessoais(
      {
        fullName: dto.fullName !== undefined ? dto.fullName : patient.fullName,
        cpf: dto.cpf !== undefined ? dto.cpf : patient.cpf,
        rg: dto.rg !== undefined ? dto.rg : patient.toObject().rg,
        birthDate:
          dto.birthDate !== undefined
            ? dto.birthDate
              ? new Date(dto.birthDate)
              : undefined
            : patient.toObject().birthDate,
        gender:
          dto.gender !== undefined ? dto.gender : patient.toObject().gender,
        email: dto.email !== undefined ? dto.email : patient.email,
        phone: dto.phone !== undefined ? dto.phone : patient.toObject().phone,
        mobile:
          dto.mobile !== undefined ? dto.mobile : patient.toObject().mobile,
        addressStreet:
          dto.addressStreet !== undefined
            ? dto.addressStreet
            : patient.toObject().addressStreet,
        addressNumber:
          dto.addressNumber !== undefined
            ? dto.addressNumber
            : patient.toObject().addressNumber,
        addressComplement:
          dto.addressComplement !== undefined
            ? dto.addressComplement
            : patient.toObject().addressComplement,
        addressNeighborhood:
          dto.addressNeighborhood !== undefined
            ? dto.addressNeighborhood
            : patient.toObject().addressNeighborhood,
        addressCity:
          dto.addressCity !== undefined
            ? dto.addressCity
            : patient.toObject().addressCity,
        addressState:
          dto.addressState !== undefined
            ? dto.addressState
            : patient.toObject().addressState,
        addressZipcode:
          dto.addressZipcode !== undefined
            ? dto.addressZipcode
            : patient.toObject().addressZipcode,
        notes: dto.notes !== undefined ? dto.notes : patient.toObject().notes,
      },
      dto.updatedBy || "system",
    );

    // Persistir
    await this.patientRepository.update(patient);

    // Publicar eventos de domínio
    const events = patient.getDomainEvents();

    for (const event of events) {
      await eventBus.publish(event);
    }

    patient.clearDomainEvents();

    logger.info("AtualizarPacienteUseCase: Success", {
      patientId: patient.id,
    });

    return { patientId: patient.id };
  }
}
