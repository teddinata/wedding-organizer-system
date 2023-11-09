// pagination meta
export const paginationMeta = computed(() => {
    return <T extends { current_page: number; per_page: number }>(options: T, total: number) => {
        const start = (options.current_page - 1) * options.per_page + 1
        const end = Math.min(options.current_page * options.per_page, total)

        return `Showing ${start} to ${end} of ${total} entries`
    }
})
