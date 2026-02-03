export const dateTimeFormatter = (
    startIso, 
    endIso,
    locale = 'en-GB'
) => {
    if (!startIso) return 'Waiting for confirmation';

    const start = new Date(startIso);

    const date = start.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
    });

    const startTime = start.toLocaleTimeString(locale,{
        hour: '2-digit',
        minute: '2-digit',
    });

    if(!endIso) return 'Waiting for confirmation';    

    const end = new Date(endIso);

    const endTime = end.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
    });

    return `${date}, ${startTime}-${endTime}` 
}