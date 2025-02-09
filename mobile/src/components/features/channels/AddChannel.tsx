import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonModal, IonRadio, IonRadioGroup, IonText, IonTextarea, IonTitle, IonToolbar, useIonToast } from "@ionic/react";
import { useFrappePostCall } from "frappe-react-sdk";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { BiGlobe, BiHash, BiLockAlt } from "react-icons/bi";
import { useHistory } from "react-router-dom";
import { ErrorBanner } from "../../layout";

interface AddChannelProps {
    presentingElement: HTMLElement | undefined
}

type CreateChannelInputs = {
    channel_name: string,
    channel_description: string
    channel_type: 'Private' | 'Public' | 'Open'
}

export const AddChannel = ({ presentingElement }: AddChannelProps) => {

    const modal = useRef<HTMLIonModalElement>(null)
    const { register, handleSubmit, formState: { errors } } = useForm<CreateChannelInputs>()
    const [channelType, setChannelType] = useState<CreateChannelInputs['channel_type']>('Public')

    const { call: callChannelCreation, error: channelCreationError } = useFrappePostCall<{ message: string }>('raven.raven_channel_management.doctype.raven_channel.raven_channel.create_channel')

    const [present] = useIonToast()

    const presentToast = (message: string) => {
        present({
            message: message,
            duration: 1500,
            position: 'bottom',
        })
    }

    const history = useHistory()

    const onSubmit = (data: CreateChannelInputs) => {
        callChannelCreation({
            channel_name: data.channel_name,
            channel_description: data.channel_description,
            type: channelType
        }).then(result => {
            if (result) {
                presentToast("Channel created successfully")
                modal.current?.dismiss()
                history.push(`channel/${result.message}`)
            }
        }).catch((err) => {
            if (err.httpStatus === 409) {
                presentToast("Channel name already exists")
            }
            else {
                presentToast("Error creating channel")
            }
        })
    }

    const onDismiss = () => {
        modal.current?.dismiss()
    }

    return (
        <IonModal ref={modal} trigger='channel-create' presentingElement={presentingElement}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton color={'medium'} onClick={onDismiss}>Cancel</IonButton>
                    </IonButtons>
                    <IonTitle>Create Channel</IonTitle>
                    <IonButtons slot="end">
                        <IonButton color={'primary'} onClick={handleSubmit(onSubmit)}>Create</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                {channelCreationError && <ErrorBanner error={channelCreationError} />}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <IonList>
                        <IonItemGroup>
                            <IonItemDivider className="py-1">
                                <IonLabel>Channel Name</IonLabel>
                            </IonItemDivider>
                            <IonItem lines='none' className="pb-2">
                                <div slot='start'>
                                    {channelType === 'Public' && <BiHash size='16' color='var(--ion-color-medium)' />}
                                    {channelType === 'Private' && <BiLockAlt size='16' color='var(--ion-color-medium)' />}
                                    {channelType === 'Open' && <BiGlobe size='16' color='var(--ion-color-medium)' />}
                                </div>
                                <IonInput
                                    required
                                    {...register("channel_name", {
                                        required: "Channel name is required"
                                    })}
                                    placeholder='bugs-bugs-bugs'
                                    className={!!errors?.channel_name ? 'ion-invalid ion-touched' : ''}
                                    aria-label="Channel Name"
                                    errorText={errors?.channel_name?.message}
                                />
                            </IonItem>
                        </IonItemGroup>

                        <IonItemGroup>
                            <IonItemDivider className="py-1">
                                <IonLabel>Description</IonLabel>
                            </IonItemDivider>
                            <IonItem lines='none'>
                                <IonTextarea
                                    {...register("channel_description")}
                                    placeholder='A channel for reporting bugs'
                                    className={errors?.channel_description ? 'ion-invalid' : ''}
                                    aria-label="Channel Description (optional)"
                                    autoGrow
                                    rows={4}
                                />
                            </IonItem>
                        </IonItemGroup>
                        <IonItemGroup>
                            <IonItemDivider className="py-1">
                                <IonLabel>Channel Type</IonLabel>
                            </IonItemDivider>
                            <IonRadioGroup value={channelType} onIonChange={e => setChannelType(e.detail.value)}>
                                <IonItem>
                                    <div slot='start'>
                                        <BiHash size='16' color='var(--ion-color-dark)' />
                                    </div>
                                    <IonRadio mode='md' className="h-8" labelPlacement="start" justify="space-between" value="Public">
                                        Public
                                    </IonRadio>
                                </IonItem>
                                <IonItem>
                                    <div slot='start'>
                                        <BiLockAlt size='16' color='var(--ion-color-dark)' />
                                    </div>
                                    <IonRadio mode='md' className="h-8" labelPlacement="start" justify="space-between" value="Private">
                                        Private
                                    </IonRadio>
                                </IonItem>

                                <IonItem>
                                    <div slot='start'>
                                        <BiGlobe size='16' color='var(--ion-color-dark)' />
                                    </div>
                                    <IonRadio mode='md' className="h-8" labelPlacement="start" justify="space-between" value="Open">
                                        Open
                                    </IonRadio>
                                </IonItem>

                                <IonItem lines='none' className="pt-2">
                                    {channelType === 'Public' && <IonText className="text-sm" color='medium'>When a channel is set to public, anyone can join the channel and read messages, but only members can post messages.</IonText>}
                                    {channelType === 'Private' && <IonText className="text-sm" color='medium'>When a channel is set to private, it can only be viewed or joined by invitation.</IonText>}
                                    {channelType === 'Open' && <IonText className="text-sm" color='medium'>When a channel is set to open, everyone is a member.</IonText>}
                                </IonItem>

                            </IonRadioGroup>

                        </IonItemGroup>

                    </IonList>
                </form>
            </IonContent>
        </IonModal>
    )
}