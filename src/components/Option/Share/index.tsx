import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Form, Input, Skeleton, Table, Tooltip, message } from "antd"
import { Trash2 } from "lucide-react"
import { Trans, useTranslation } from "react-i18next"
import { SaveButton } from "~/components/Common/SaveButton"
import { deleteWebshare, getAllWebshares, getUserId } from "@/db"
import { getPageShareUrl, setPageShareUrl } from "~/services/ollama"
import { verifyPageShareURL } from "~/utils/verify-page-share"

export const OptionShareBody = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(["settings"])

  const { status, data } = useQuery({
    queryKey: ["fetchShareInfo"],
    queryFn: async () => {
      const [url, shares] = await Promise.all([
        getPageShareUrl(),
        getAllWebshares()
      ])
      return { url, shares }
    }
  })

  const onSubmit = async (values: { url: string }) => {
    const isOk = await verifyPageShareURL(values.url)
    if (isOk) {
      await setPageShareUrl(values.url)
    }
  }

  const onDelete = async ({
    api_url,
    share_id,
    id
  }: {
    id: string
    share_id: string
    api_url: string
  }) => {
    const owner_id = await getUserId()
    const res = await fetch(`${api_url}/api/v1/share/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        share_id,
        owner_id
      })
    })
    if (!res.ok) throw new Error("Failed to delete share link")
    await deleteWebshare(id)
    return "ok"
  }

  const { mutate: updatePageShareUrl, isPending: isUpdatePending } =
    useMutation({
      mutationFn: onSubmit,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["fetchShareInfo"]
        })
        message.success(t("manageShare.notification.pageShareSuccess"))
      },
      onError: (error) => {
        message.error(error?.message || t("manageShare.notification.someError"))
      }
    })

  const { mutate: deleteMutation } = useMutation({
    mutationFn: onDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["fetchShareInfo"]
      })
      message.success(t("manageShare.notification.webShareDeleteSuccess"))
    },
    onError: (error) => {
      message.error(error?.message || t("manageShare.notification.someError"))
    }
  })

  return (
    <div className="flex flex-col space-y-3">
      {status === "pending" && <Skeleton paragraph={{ rows: 4 }} active />}
      {status === "success" && (
        <div>
          <div>
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                {t("manageShare.heading")}
              </h2>
              <div className="border border-b border-gray-200 dark:border-gray-600 mt-3 mb-6"></div>
            </div>
            <Form
              layout="vertical"
              onFinish={updatePageShareUrl}
              initialValues={{
                url: data.url
              }}>
              <Form.Item
                name="url"
                help={
                  <Trans
                    i18nKey="settings:manageShare.form.url.help"
                    components={{
                      anchor: (
                        <a
                          href="https://github.com/n4ze3m/page-assist/blob/main/page-share.md"
                          target="__blank"
                          className="text-blue-600 dark:text-blue-400"></a>
                      )
                    }}
                  />
                }
                rules={[
                  {
                    required: true,
                    message: t("manageShare.form.url.required")
                  }
                ]}
                label={t("manageShare.form.url.label")}>
                <Input
                  placeholder={t("manageShare.form.url.placeholder")}
                  size="large"
                />
              </Form.Item>
              <Form.Item>
                <div className="flex justify-end">
                  <SaveButton disabled={isUpdatePending} btnType="submit" />
                </div>
              </Form.Item>
            </Form>
          </div>
          <div>
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                {t("manageShare.webshare.heading")}
              </h2>
              <div className="border border-b border-gray-200 dark:border-gray-600 mt-3 mb-6"></div>
            </div>
            <div>
              <Table
                dataSource={data.shares}
                columns={[
                  {
                    title: t("manageShare.webshare.columns.title"),
                    dataIndex: "title",
                    key: "title"
                  },
                  {
                    title: t("manageShare.webshare.columns.url"),
                    dataIndex: "url",
                    key: "url",
                    render: (url: string) => (
                      <a
                        href={url}
                        target="__blank"
                        className="text-blue-600 dark:text-blue-400">
                        {url}
                      </a>
                    )
                  },
                  {
                    title: t("manageShare.webshare.columns.actions"),
                    render: (_, render) => (
                      <Tooltip title={t("manageShare.webshare.tooltip.delete")}>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                t("manageShare.webshare.confirm.delete")
                              )
                            ) {
                              deleteMutation({
                                id: render.id,
                                share_id: render.share_id,
                                api_url: render.api_url
                              })
                            }
                          }}
                          className="text-red-500 dark:text-red-400">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </Tooltip>
                    )
                  }
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
