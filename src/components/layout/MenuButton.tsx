import { Menu, Transition } from '@headlessui/react';
import {
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { FolderIcon, UserCircleIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Fragment } from 'react';

function MenuButton(props: any) {
    const router = useRouter();
    return (
        <Menu as="div" className="relative">
            <div className="flex items-center">
                <Menu.Button className="rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                        {props?.name?.[0] ?? '?'.toUpperCase()}
                    </div>

                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 mt-1 min-w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-gray-200 ring-opacity-5 focus:outline-none flex flex-col gap-1 py-1">
                    <div className="px-1">
                        <Menu.Item>

                            <div className="flex w-full items-center rounded-md gap-2 px-2 py-2 text-md text-gray-400">
                                <UserCircleIcon
                                    className="h-6 w-6 text-gray-500 hover:text-gray-700"
                                    aria-hidden="true"
                                />{props?.email || 'Loading...'}
                            </div>
                        </Menu.Item>
                    </div>
                    <div className="px-1">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    className={`${active ? 'bg-violet-100 text-violet-800' : 'text-gray-900'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                    onClick={() => {
                                        router.push('/me/projects');
                                    }}
                                >
                                    <FolderIcon className="mr-2 h-5 w-5 text-gray-500 hover:text-gray-700" aria-hidden="true" />
                                    My Projects
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                    <div className="px-1">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    className={`${active ? 'bg-red-200 text-red-800' : 'text-gray-900'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                    onClick={() => {
                                        localStorage.removeItem('token');
                                        localStorage.removeItem('email');
                                        router.push('/login');
                                    }}
                                >
                                    <ArrowRightOnRectangleIcon
                                        className="mr-2 h-5 w-5"
                                        aria-hidden="true"
                                    />
                                    Logout
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}

export default MenuButton;
