export const useGeneratedCode = computed(() => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000)
    return `V${randomNumber}`
})