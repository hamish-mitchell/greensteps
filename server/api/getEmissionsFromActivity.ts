import type { AustralianState } from "../types/australianState";
import type { FoodCategory } from "../types/foodCategory";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    console.log("Received body:", body);

    switch (body.activity.type) {
        case "electricity":
            return getElectricityEmissions(
                body.activity.location,
                body.activity.amount
            );
        case "food":
            return getFoodEmissions(
                body.activity.location,
                body.activity.amount
            );
        // Add more cases for other activity types as needed
    }

    return { message: "Data received successfully!", data: body };
});

/**
 * Get electricity emissions based on location and amount.
 */
function getElectricityEmissions(
    location: AustralianState,
    kilowattHours: number
): { emissions: number | null; message?: string } {
    if (kilowattHours > 10000) {
        return { emissions: null, message: "too much elecricity" };
    }

    let emissions: number | null = null;
    switch (location) {
        case "au-act":
            emissions = kilowattHours * 2.56053;
            break;
        case "au-nsw":
            emissions = kilowattHours * 2.56053;
            break;
        case "au-nt":
            emissions = kilowattHours * 2.9931;
            break;
        case "au-qld":
            emissions = kilowattHours * 2.57974;
            break;
        case "au-sa":
            emissions = kilowattHours * 2.37285;
            break;
        case "au-tas":
            emissions = kilowattHours * 1.58247;
            break;
        case "au-vic":
            emissions = kilowattHours * 2.07292;
            break;
        case "au-wa":
            emissions = kilowattHours * 2.89386;
            break;
        default:
            return { emissions: null, message: "Unknown location" };
    }
    return { emissions };
}

/**
 * Get food emissions based on type of food and amount.
 */
function getFoodEmissions(
    type: FoodCategory,
    kilograms: number
): { emissions: number | null; message?: string } {
    if (kilograms > 1000) {
        return { emissions: null, message: "too much food" };
    }

    let emissions: number | null = null;
    switch (type) {
        case "red_meat":
            emissions = kilograms * 23.59467;
            break;
        case "white_meat":
            emissions = kilograms * 6.92667;
            break;
        case "grain":
            emissions = kilograms * 2.472;
            break;
        case "grain_alternative":
            emissions = kilograms * 3.3;
            break;
        case "fruit_vegetable":
            emissions = kilograms * 2.54667;
            break;
        case "dairy":
            emissions = kilograms * 6.769;
            break;
        case "dairy_alternative":
            emissions = kilograms * 0.568;
            break;
        default:
            return { emissions: null, message: "Unknown food type" };
    }
    return { emissions };
}
