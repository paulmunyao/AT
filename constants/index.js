const Menu = {
    1: {
        message:
            'Press 1 for Ambulance, 2 for Fire Engine and 3 to report a crime',
    },
    1.1: {
        message:
            'An ambulance will be on your way. Send your location when prompted',
        forwardCall: true,
    },
    1.2: {
        message:
            'A fire engine will be sent to you, share your location when prompted',
        forwardCall: true,
    },

    1.3: {
        message: 'The police will be called, share your location when prompted',
        forwardCall: true,
    },

    2: { message: 'Press 1 to search by title 2 to search by plot number' },
    2.1: { message: 'Enter the title of the property' },
    2.2: { message: 'Enter the plot number of the property' },
    '2.x.x': {
        message: 'Property matching your search criteria is not available',
    },
    3: {
        message: 'Press 1 for bursary funds, 2 for health insurance',
    },
    3.1: {
        message:
            'There are no bursary funds at the moment. Visit the CDE offices for assistance',
        end: true,
    },
    3.2: {
        message:
            'There are no health insurance funds at the moment, Covid 19 vaccination ongoing. Visit any health facility to get vaccinated. Thankyou',
        end: true,
    },
    4: {
        message:
            'Our covid 19 vaccine is currently in progress. Please visit any health facility to get vaccinated. Thankyou',
        end: true,
    },
};
