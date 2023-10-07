import React from 'react'

interface ProjectProps {
    name: string;
    image: string
}

function Project({ image, name }: ProjectProps): JSX.Element {
    return (
        <div className="flex flex-col justify-between w-full space-y-6 text-2xl  text-white uppercase md:flex-row md:space-y-0 md:space-x-6 ">
            <div className="group relative  md:w-1/4 border-indigo-500/75">
                {/* desktop image */}
                <img src={image} alt="" className="hidden w-full duration-200 md:block group-hover:scale-110 " />
                {/* mobile image */}
                <img src={image} alt="" className='md:hidden w-full ' />
                {/* gradient */}
                <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-b from-transparent to-gray-900 group-hover:from-gray-50 group-hover:to-white border-black-300 ">
                </div>
                <h5 className="absolute px-6 duration-200 w-52 bottom-4 md:bottom-10 md:px-10 group-hover:scale-110 group-hover:text-black ">
                    {name}
                </h5>
            </div>
        </div>
    )
}

export default Project