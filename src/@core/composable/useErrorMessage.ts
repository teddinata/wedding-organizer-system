type ErrorObjects = {
    [key: string]: string[]
}

export const useErrorMessage = (errors: ErrorObjects) => {
    const isError = ref<boolean>(true)
    const errorMessages = []
    let message = ''

    const keys = Object.keys(errors)
    console.log(errors)

    for (const key of keys) {
        const values = errors[key]
        for (const value of values) {
            errorMessages.push(value)
            message = errorMessages.join(" ").trim()
        }
    }

    return { errorMessages, message, isError }
}