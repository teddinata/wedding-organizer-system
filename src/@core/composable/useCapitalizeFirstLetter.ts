export const useCapitalizeFirstLetter = (str: string) => {
    const words = str.split(' ')

    return computed(() => {
        const capitalizedWords = words.map((word) => {
            if (word.length > 0) {
                const firstLetter = word.charAt(0).toUpperCase();
                const restOfWord = word.slice(1).toLowerCase();
                return firstLetter + restOfWord;
            }
            return word;
        });
    
        // Join the capitalized words back into a single string
        const resultString = capitalizedWords.join(' ');
    
        return resultString;
    })

}