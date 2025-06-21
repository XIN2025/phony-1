export const isLastWeekOfMonth = (weekIndex: number) => {
    return (weekIndex + 1) % 4 === 0;
};

