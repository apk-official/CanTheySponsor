import React, { useState } from 'react'
import { Route, TypeRating } from "@/types";
import Search from './SearchInput'
import RouteFilter from './RouteFilter'
import TypeRatingFilter from './TypeRatingFilter'
import LocationFilter from './LocationFilter';

export default function SearchFilters() {
  const [currentRoute, setCurrentRoute] = useState<Route>("All")
  const [currentTypeRating, setCurrentTypeRating] = useState<TypeRating>("All")
  return (
    <section className='flex flex-col items-start justify-between gap-3'>
      <Search />
      <div className='flex items-center justify-start gap-3 flex-wrap w-full'>
        <p className='font-mono text-sm text-muted-foreground'>FILTERS: </p>
        <RouteFilter value={currentRoute} onValueChange={setCurrentRoute} />
        <TypeRatingFilter value={currentTypeRating} onValueChange={setCurrentTypeRating} />
        <LocationFilter/>
      </div>
    </section>
  )
}
