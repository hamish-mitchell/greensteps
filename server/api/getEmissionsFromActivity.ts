export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    console.log("Received body:", body);

    return { message: 'Data received successfully!', data: body };
});



// function getElectricityEmissions(location: string, amount: number) {
//     switch (location) {
//         case 
//     }
// }