import { KycStatus } from "@prisma/client";

export function calculateProfileCompletion(user:any):number{
    /**here fetch the fields */
    const fields = [
        user.fullName, user.phoneNumber, user.instituteAddress, user.city,user.state, user.postalCode
    ];
    console.log(`The fields are taking for calculation : ${fields}`);
    const filled = fields.filter(Boolean).length;
    console.log('The filled status are :', filled);
    return Math.round((filled/fields.length)*100);
}

/**here I write the functions for the get Next CTA steps */
export function getNextSteps(status:KycStatus):string{
    switch(status){
        case "Pending":
            return "Please complete your profile"
        case "UnderReview":
            return "All the kyc details are under review"
        case "Approved":
            return "All the KYC details are approved"
        case "Rejected":
            return "For some reasons your KYC are rejected"
        case "Suspended":
            return "For Some reasons are KYC details are suspended"
        default:
            return "Start Onboarding"
    }
}