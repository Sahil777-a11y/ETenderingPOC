using eTendering.Core.DTOs;

namespace eTendering.Core.Helpers
{
    public static class ResponseFactory
    {
        /// <summary>
        /// Creates a success response with the provided data and optional message.
        /// Automatically extracts the Id property from the data if it exists.
        /// </summary>
        /// <typeparam name="T">Type of the data being returned.</typeparam>
        /// <param name="data">The response data.</param>
        /// <param name="message">Optional success message.</param>
        /// <returns>A <see cref="GenericResponseDto{T}"/> representing a successful operation.</returns>
        public static GenericResponseDto<T> Success<T>(T data, string message = "Operation Successful", MetaDataDto? metaData = null)
        {
            // Safely extract Id if it exists; default to 0
            long id = 0;
            if (data != null)
            {
                var idProperty = data.GetType().GetProperty("Id");
                if (idProperty != null)
                {
                    id = Convert.ToInt64(idProperty.GetValue(data) ?? 0);
                }
            }

            return new GenericResponseDto<T>
            {
                Id = id,
                Success = true,
                Message = message,
                Data = data,
                MetaData = metaData
            };
        }

        /// <summary>
        /// Creates a failure response with an optional Id.
        /// </summary>
        /// <typeparam name="T">Type of the data that would have been returned.</typeparam>
        /// <param name="message">Failure message.</param>
        /// <param name="id">Optional Id associated with the failed operation.</param>
        /// <returns>A <see cref="GenericResponseDto{T}"/> representing a failed operation.</returns>
        public static GenericResponseDto<T> Failure<T>(string message, MetaDataDto? metaData = null, long id = 0)
        {
            return new GenericResponseDto<T>
            {
                Id = id,
                Success = false,
                Message = message,
                Data = default,
                MetaData = metaData
            };
        }

        public static GenericResponseDto<T> SuccessWithValidation<T>(T data, string message, MetaDataDto metaData, string? AlertType = "")
        {
            long id = 0;

            if (data != null)
            {
                var idProperty = data.GetType().GetProperty("Id");
                if (idProperty != null)
                {
                    id = Convert.ToInt64(idProperty.GetValue(data) ?? 0);
                }
            }

            return new GenericResponseDto<T>
            {
                Id = id,
                Success = false,
                Message = message,
                Data = data,
                AlertType = AlertType,
                MetaData = metaData
            };
        }

    }
}
