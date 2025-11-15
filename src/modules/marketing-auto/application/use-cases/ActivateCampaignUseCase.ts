import { Campaign } from '../../domain/entities/Campaign';
import { ICampaignRepository } from '../../domain/repositories/ICampaignRepository';

export interface ActivateCampaignInput {
  campaignId: string;
}

export class ActivateCampaignUseCase {
  constructor(private campaignRepository: ICampaignRepository) {}

  async execute(input: ActivateCampaignInput): Promise<Campaign> {
    const campaign = await this.campaignRepository.findById(input.campaignId);
    
    if (!campaign) {
      throw new Error('Campanha não encontrada');
    }

    campaign.activate();
    await this.campaignRepository.update(campaign);
    
    return campaign;
  }
}
