import { useFrappeGetCall } from 'frappe-react-sdk'
import { createContext, PropsWithChildren, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useFrappeEventListener } from '../../hooks/useFrappeEventListener'
import { ChannelData } from '../../types/Channel/Channel'
import { User } from '../../types/User/User'

type ChannelInfo = {
    channel_members: ChannelMembersDetails[],
    channel_data: ChannelData
}

export type ChannelMembersDetails = {
    name: string,
    first_name: string,
    full_name: string,
    user_image: string,
    is_admin: 1 | 0
}

export const ChannelContext = createContext<{ channelMembers: Record<string, ChannelMembersDetails>; channelData?: ChannelData, users: Record<string, User> }>({ channelMembers: {}, users: {} })

export const ChannelProvider = ({ children }: PropsWithChildren) => {

    const { channelID } = useParams()
    const { data, error, mutate } = useFrappeGetCall<{ message: ChannelInfo }>('raven.raven_channel_management.doctype.raven_channel_member.raven_channel_member.get_channel_members_and_data', {
        channel_id: channelID
    }, undefined, {
        revalidateOnFocus: false
    })
    const { data: users, error: usersError } = useFrappeGetCall<{ message: User[] }>('raven.raven_channel_management.doctype.raven_channel.raven_channel.get_raven_users_list', undefined, undefined, {
        revalidateOnFocus: false
    })

    useFrappeEventListener('member_added', (data) => {
        if (data.channel_id === channelID) {
            mutate()
        }
    })

    useFrappeEventListener('member_removed', (data) => {
        if (data.channel_id === channelID) {
            mutate()
        }
    })

    useFrappeEventListener('channel_updated', (data) => {
        if (data.channel_id === channelID) {
            mutate()
        }
    })

    const channelInfo = useMemo(() => {
        const cm: Record<string, ChannelMembersDetails> = {}
        data?.message.channel_members.forEach((member: ChannelMembersDetails) => {
            cm[member.name] = member
        })
        const userData: Record<string, User> = {}
        users?.message.forEach((user: User) => {
            userData[user.name] = user
        })
        return {
            channelMembers: cm,
            users: userData,
            channelData: data?.message.channel_data
        }
    }, [data, users])

    /**
     * Set the last channel in local storage
     */
    useEffect(() => {
        if (channelID) {
            localStorage.setItem('ravenLastChannel', channelID)
        }
    }, [channelID])

    return (
        <>
            {data?.message?.channel_members && <ChannelContext.Provider value={channelInfo}>
                {children}
            </ChannelContext.Provider>}
        </>
    )
}