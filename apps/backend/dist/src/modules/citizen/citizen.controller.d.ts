import { CitizenService } from './citizen.service';
import { UpdateCitizenProfileDto } from './dto/citizen.dto';
export declare class CitizenController {
    private readonly citizenService;
    constructor(citizenService: CitizenService);
    getProfile(userId: string): Promise<{
        profile: {
            id: string;
            userId: string;
            firstName: string;
            lastName: string;
            dateOfBirth: Date;
            age: number;
            gender: import("../../domain/citizen/citizen.entity").Gender;
            maritalStatus: import("../../domain/citizen/citizen.entity").MaritalStatus;
            socialCategory: import("../../domain/citizen/citizen.entity").SocialCategory;
            employmentStatus: import("../../domain/citizen/citizen.entity").EmploymentStatus;
            annualIncomeINR: number;
            disabilityType: import("../../domain/citizen/citizen.entity").DisabilityType;
            disabilityPercent: number;
            isBplCardHolder: boolean;
            state: string;
            district: string;
            address: {
                streetAddress: string;
                city: string;
                district: string;
                state: string;
                pincode: string;
                isRural: boolean;
            } | null;
            completionPercentage: number;
        };
    }>;
    updateProfile(userId: string, dto: UpdateCitizenProfileDto): Promise<{
        message: string;
        profile: {
            id: string;
            userId: string;
            completionPercentage: number;
        };
    }>;
}
