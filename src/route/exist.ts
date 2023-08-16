const Exist = (permalink: string, name: string) => {
  const room = global.rooms.FindRoom({
    perma: permalink,
    name
  } as any)

  return room != null;
};

export { Exist };
