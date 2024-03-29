import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
const queryClient = new QueryClient()
import { App, ConfigProvider, Empty, theme } from "antd"
import { StyleProvider } from "@ant-design/cssinjs"
import { useDarkMode } from "~/hooks/useDarkmode"
import { OptionRouting } from "~/routes"
import "~/i18n"
import { useTranslation } from "react-i18next"
import { DialoqProvider } from "@/components/DialoqProvider"

function IndexOption() {
  const { mode } = useDarkMode()
  const { t } = useTranslation()
  return (
    <MemoryRouter>
      <ConfigProvider
        theme={{
          algorithm:
            mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm
        }}
        renderEmpty={() => (
          <Empty
            imageStyle={{
              height: 60
            }}
            description={t("common:noData")}
          />
        )}>
        <StyleProvider hashPriority="high">
          <App>
            <DialoqProvider>
              <QueryClientProvider client={queryClient}>
                <OptionRouting />
                <ToastContainer />
              </QueryClientProvider>
            </DialoqProvider>
          </App>
        </StyleProvider>
      </ConfigProvider>
    </MemoryRouter>
  )
}

export default IndexOption
